using BetterIServ.Backend.Entities;
using Microsoft.AspNetCore.Mvc;
using PuppeteerSharp;
using Credentials = BetterIServ.Backend.Entities.Credentials;

namespace BetterIServ.Backend.Controllers; 

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase {
    
    [HttpPost("login")]
    public async Task<ActionResult<AuthKeys>> GetAuthKeysV2([FromBody] Credentials credentials) {
        await using var browser = await Puppeteer.LaunchAsync(new LaunchOptions { Headless = true });
        await using var page = await browser.NewPageAsync();
        await page.GoToAsync($"https://{credentials.Domain}/iserv/auth/login");

        await page.WaitForSelectorAsync("#form-username > input");
        await page.Keyboard.TypeAsync(credentials.Username);
        await page.Keyboard.PressAsync("Tab");
        await page.Keyboard.TypeAsync(credentials.Password);
        await page.ClickAsync("body > div > main > div > div.panel-body > form > div.row > div:nth-child(1) > button");
        await Task.Delay(500);

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

}