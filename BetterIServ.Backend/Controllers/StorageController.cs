using System.Dynamic;
using System.Text;
using BetterIServ.Backend.Entities;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace BetterIServ.Backend.Controllers; 

[ApiController]
[Route("storage")]
public class StorageController : ControllerBase {

    [HttpPost]
    public async Task<IActionResult> SetItem([FromQuery] string item, [FromQuery] string user) {
        var data = await new StreamReader(Request.Body).ReadToEndAsync();
        var file = new FileInfo($"/data/{user}/{item}.json");
        
        if (file.Directory?.Exists != true) file.Directory?.Create();

        await using var stream = file.Exists ? file.OpenWrite() : file.Create();
        await stream.WriteAsync(Encoding.UTF8.GetBytes(data));
        return Ok();
    }

    [HttpGet]
    public async Task<ActionResult<SingleResult<dynamic>>> GetItem([FromQuery] string item, [FromQuery] string user) {
        var file = new FileInfo($"/data/{user}/{item}.json");
        if (!file.Exists) return NotFound();

        await using var stream = file.OpenRead();
        var data = await new StreamReader(stream).ReadToEndAsync();
        return Ok(new SingleResult<string>{Value = data});
    }

    [HttpDelete]
    public IActionResult Clear([FromQuery] string user) {
        if (!Directory.Exists($"/data/{user}")) return NotFound();
        Directory.Delete($"/data/{user}", true);
        return Ok();
    }

}