using System.Net;
using BetterIServ.Backend.Entities;
using Microsoft.AspNetCore.Mvc;
using WebDav;

namespace BetterIServ.Backend.Controllers;

[ApiController]
[Route("webdav")]
public class WebDavController : ControllerBase {

    [HttpPost("content")]
    public async Task<ActionResult<DirectoryContent[]>> GetDirContent([FromBody] Credentials credentials, [FromQuery] string dir) {
        var baseAddress = new Uri($"https://webdav.{credentials.Domain}");
        using var client = new WebDavClient(new WebDavClientParams {
            BaseAddress = baseAddress,
            Credentials = new NetworkCredential(credentials.Username, credentials.Password)
        });

        var result = await client.Propfind(baseAddress + dir);
        if (!result.IsSuccessful) return NotFound(result.Description);

        var contents = new List<DirectoryContent>();
        foreach (var resource in result.Resources) {
            var name = resource.Uri.Split("/")[^1];
            if (resource.Uri.EndsWith("/"))
                name = resource.Uri.Split("/")[^2];
            
            var content = new DirectoryContent {
                Url = resource.Uri,
                LastModified = resource.LastModifiedDate ?? DateTime.Now,
                Size = resource.ContentLength ?? 0,
                Type = resource.IsCollection ? "dir" : "file",
                Name = name
            };
            contents.Add(content);
        }
        contents.RemoveAt(0);

        return contents.OrderBy(item => item.Type).ToArray();
    }

    [HttpPost("download")]
    public async Task<FileStreamResult> DonwloadFile([FromBody] Credentials credentials, [FromQuery] string url) {
        var baseAddress = new Uri($"https://webdav.{credentials.Domain}");
        using var client = new WebDavClient(new WebDavClientParams {
            BaseAddress = baseAddress,
            Credentials = new NetworkCredential(credentials.Username, credentials.Password)
        });

        var file = await client.GetRawFile(new Uri(baseAddress + url));
        if (!file.IsSuccessful) {
            Response.StatusCode = StatusCodes.Status404NotFound;
            return new FileStreamResult(Stream.Null, "");
        }

        var split = url.Split("/");
        return new FileStreamResult(file.Stream, "application/octet-stream") {
            FileDownloadName = split[^1]
        };
    }

    [HttpPost("delete")]
    public async Task<IActionResult> DeleteElement([FromBody] Credentials credentials, [FromQuery] string url) {
        var baseAddress = new Uri($"https://webdav.{credentials.Domain}");
        using var client = new WebDavClient(new WebDavClientParams {
            BaseAddress = baseAddress,
            Credentials = new NetworkCredential(credentials.Username, credentials.Password)
        });

        var result = await client.Delete(new Uri(baseAddress + url));
        if (result.IsSuccessful) return Ok();
        return BadRequest(result.Description);
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadFile([FromQuery] string url, [FromForm] string domain, [FromForm] string username, [FromForm] string password) {
        var baseAddress = new Uri($"https://webdav.{domain}");
        using var client = new WebDavClient(new WebDavClientParams {
            BaseAddress = baseAddress,
            Credentials = new NetworkCredential(username, password)
        });

        var result = await client.PutFile(new Uri(baseAddress + url), Request.Form.Files[0].OpenReadStream());
        if (result.IsSuccessful) return Ok();
        return BadRequest(result.Description);
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreateFolder([FromBody] Credentials credentials, [FromQuery] string url) {
        var baseAddress = new Uri($"https://webdav.{credentials.Domain}");
        using var client = new WebDavClient(new WebDavClientParams {
            BaseAddress = baseAddress,
            Credentials = new NetworkCredential(credentials.Username, credentials.Password)
        });

        var result = await client.Mkcol(new Uri(baseAddress + url));
        if (result.IsSuccessful) return Ok();
        return BadRequest(result.Description);
    }

    [HttpPost("move")]
    public async Task<IActionResult> MoveElement([FromBody] Credentials credentials, [FromQuery] string url, [FromQuery] string newUrl) {
        var baseAddress = new Uri($"https://webdav.{credentials.Domain}");
        using var client = new WebDavClient(new WebDavClientParams {
            BaseAddress = baseAddress,
            Credentials = new NetworkCredential(credentials.Username, credentials.Password)
        });

        var result = await client.Move(new Uri(baseAddress + url), new Uri(baseAddress + newUrl));
        if (result.IsSuccessful) return Ok();
        return BadRequest(result.Description);
    }

}