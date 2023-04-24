using System.Text;
using BetterIServ.Backend.Entities;
using HtmlAgilityPack;
using Microsoft.AspNetCore.Mvc;

namespace BetterIServ.Backend.Controllers; 

[ApiController]
[Route("units")]
public class UnitsController : ControllerBase {

    [HttpGet("substitution")]
    public async Task<ActionResult<UnitsData>> GetToday([FromQuery] string url) {
        var client = new HttpClient();
        var buffer = await client.GetByteArrayAsync(url);
        var raw = Encoding.GetEncoding("ISO-8859-1").GetString(buffer);
        var html = new HtmlDocument();
        html.LoadHtml(raw);

        var data = new UnitsData {
            Notifications = new List<string>(),
            Substitutions = new List<Substitution>()
        };

        var info = html.DocumentNode.SelectSingleNode("//body/center[1]/table");
        for (int i = 2; i < info.ChildNodes.Count; i++) {
            var notification = info.ChildNodes[i];
            if (notification.ChildNodes.Count == 2) {
                data.Notifications.Add(
                    notification.ChildNodes[0].InnerText +
                    notification.ChildNodes[1].InnerText
                );
            }
            else if (notification.ChildNodes.Count == 1) {
                data.Notifications.Add(notification.ChildNodes[0].InnerText);
            }
        }

        var substitutions = html.DocumentNode.SelectNodes("//body/center[1]")[0].ChildNodes[6];
        for (int i = 4; i < substitutions.ChildNodes.Count; i++) {
            var node = substitutions.ChildNodes[i];
            if (node.ChildNodes.Count < 9) continue;
            
            var substitution = new Substitution {
                Times = node.ChildNodes[1].InnerText.Split(" - ").Select(int.Parse).ToArray(),
                Type = node.ChildNodes[2].InnerText,
                Representative = node.ChildNodes[3].InnerText,
                NewLesson = node.ChildNodes[4].InnerText,
                Lesson = node.ChildNodes[5].InnerText,
                Room = node.ChildNodes[6].InnerText,
                Teacher = node.ChildNodes[7].InnerText,
                Description = node.ChildNodes[9].InnerText
            };

            var classes = node.ChildNodes[0].InnerText;

            if (!classes.StartsWith("Q")) {
                string grade = new string(classes.ToCharArray().Where(char.IsNumber).ToArray());
                var subClasses = classes.Replace(grade, "").ToCharArray();
                var result = new string[subClasses.Length];

                for (int j = 0; j < subClasses.Length; j++) {
                    result[j] = grade + subClasses[j];
                }
                substitution.Classes = result;
            }
            else {
                substitution.Classes = new[] { classes };
            }

            data.Substitutions.Add(substitution);
        }

        return data;
    }

}