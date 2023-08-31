using System.Globalization;
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
        var cols = new UnitsCollumns {
            Classes = 0,
            Times = 1,
            Repre = 2,
            Teacher = 3,
            Lesson = 4,
            Room = 5,
            Type = 6,
            Desc = 7
        };
        
        for (int i = 1; i < substitutions.ChildNodes.Count; i++) {
            var node = substitutions.ChildNodes[i];
            if (node.ChildNodes.Count < 8) continue;
            if (!node.ChildNodes[cols.Times].InnerText.Contains("-")) continue;
            
            var substitution = new Substitution {
                Times = node.ChildNodes[cols.Times].InnerText.Split(" - ").Select(int.Parse).ToArray(),
                Type = node.ChildNodes[cols.Type].InnerText.Replace("Vtr. ohne Lehrer", "Stillarbeit"),
                Representative = node.ChildNodes[cols.Repre].InnerText,
                NewLesson = node.ChildNodes[cols.Lesson].InnerText,
                Lesson = node.ChildNodes[cols.Lesson].InnerText,
                Room = node.ChildNodes[cols.Room].InnerText,
                Teacher = node.ChildNodes[cols.Teacher].InnerText,
                Description = node.ChildNodes[cols.Desc].InnerText
            };

            var classes = node.ChildNodes[cols.Classes].InnerText;

            if (!classes.StartsWith("Q")) {
                string grade = new string(classes.ToCharArray().Where(char.IsNumber).ToArray());
                if (string.IsNullOrEmpty(grade)) continue;

                var subClasses = classes.Replace(grade, "").ToCharArray();
                var result = new string[subClasses.Length];

                for (int j = 0; j < subClasses.Length; j++) {
                    result[j] = grade + subClasses[j];
                }
                substitution.Classes = result;
            }
            else {
                substitution.Classes = (classes?.Length == 3 ? new[] { "Q1", "Q2" } : new[] { classes })!;
            }

            data.Substitutions.Add(substitution);
        }
        
        var date = html.DocumentNode.SelectNodes("//body/center[1]")[0].ChildNodes[1];
        data.Date = DateTime.Parse(date.InnerHtml.Split(" ")[0], new CultureInfo("de-DE"));

        return data;
    }

}