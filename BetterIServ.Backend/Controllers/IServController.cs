using BetterIServ.Backend.Entities;
using HtmlAgilityPack;
using Microsoft.AspNetCore.Mvc;
using PuppeteerSharp;
using Credentials = BetterIServ.Backend.Entities.Credentials;

namespace BetterIServ.Backend.Controllers; 

[ApiController]
[Route("iserv")]
public class IServController : ControllerBase {
    
    [HttpPost("login")]
    public async Task<ActionResult<AuthKeys>> GetAuthKeysV2([FromBody] Credentials credentials) {
        await using var browser = await Puppeteer.LaunchAsync(new LaunchOptions { Headless = true, Args = new []{"--no-sandbox"} });
        await using var page = await browser.NewPageAsync();
        await page.GoToAsync($"https://{credentials.Domain}/iserv/auth/login");

        await page.WaitForSelectorAsync("#form-username > input");
        await page.Keyboard.TypeAsync(credentials.Username);
        await page.Keyboard.PressAsync("Tab");
        await page.Keyboard.TypeAsync(credentials.Password);
        await page.ClickAsync("body > div > main > div > div.panel-body > form > div.row > div:nth-child(1) > button");
        await Task.Delay(2000);

        var authKeys = new AuthKeys();
        var cookies = await page.GetCookiesAsync();
        foreach (var cookie in cookies) {
            switch (cookie.Name) {
                case "IServSession":
                    authKeys.Session = cookie.Value;
                    break;
                case "IServSAT":
                    authKeys.Sat = cookie.Value;
                    break;
                case "IServAuthSID":
                    authKeys.AuthSid = cookie.Value;
                    break;
                case "IServSATId":
                    authKeys.SatId = cookie.Value;
                    break;
                case "IServAuthSession":
                    authKeys.AuthSession = cookie.Value;
                    break;
            }
        }

        return authKeys;
    }

    [HttpPost("groups")]
    public async Task<ActionResult<SingleResult<string[]>>> GetCourses([FromBody] AuthKeys keys, [FromQuery] string domain) {
        var client = new HttpClient();
        var request = new HttpRequestMessage {
            Method = HttpMethod.Get,
            RequestUri = new Uri($"https://{domain}/iserv/profile"),
            Headers = {
                { "cookie", keys.ToCookieString() }
            }
        };
        var raw = await (await client.SendAsync(request)).Content.ReadAsStringAsync();
        var html = new HtmlDocument();
        html.LoadHtml(raw);

        var list = html.DocumentNode.SelectSingleNode("//body/div/div[2]/div[3]/div/div/div[2]/div/div/div/div/ul[1]");
        var courses = new List<string>();
        foreach (var child in list.ChildNodes) {
            if (child.ChildNodes.Count < 1) continue;
            courses.Add(child.ChildNodes[0].InnerText);
        }
        
        return new SingleResult<string[]> { Value = courses.ToArray() };
    }

}