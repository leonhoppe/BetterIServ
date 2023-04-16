using System.Net;
using Microsoft.AspNetCore.Mvc;

namespace BetterIServ.Backend.Controllers; 

[ApiController]
public class HelperController : ControllerBase {

    [HttpPost("/login")]
    public async Task<ActionResult<string>> Login([FromForm] string email, [FromForm] string password) {
        try {
            using var client = new HttpClient(new HttpClientHandler { AutomaticDecompression = DecompressionMethods.Deflate | DecompressionMethods.GZip, AllowAutoRedirect = false }) { Timeout = TimeSpan.FromSeconds(5) };
        
            var split = email.Split("@");
            var username = split[0];
            var domain = split[1];

            var form = new FormUrlEncodedContent(new[] {
                new KeyValuePair<string, string>("_username", username),
                new KeyValuePair<string, string>("_password", password)
            });
            
            var request = new HttpRequestMessage {
                RequestUri = new Uri($"https://{domain}/iserv/auth/login"),
                Method = HttpMethod.Post,
                Content = form
            };
 
            var response = await client.SendAsync(request);
            var header = response.Headers.GetValues("Set-Cookie").First();
            var part = header.Split(";")[0];

            if (!part.Contains("IServAuthSession")) throw new Exception();
        
            return Ok(part.Replace("IServAuthSession=", ""));
        }
        catch (Exception) {
            return Unauthorized();
        }
    }

}