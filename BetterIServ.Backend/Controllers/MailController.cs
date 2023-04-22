using System.Net;
using System.Net.Mail;
using System.Text;
using Aspose.Email.Clients.Imap;
using BetterIServ.Backend.Entities;
using Microsoft.AspNetCore.Mvc;

namespace BetterIServ.Backend.Controllers; 

[ApiController]
[Route("mail")]
public class MailController : ControllerBase {

    [HttpPost("send")]
    public async Task<IActionResult> SendMail([FromBody] MailData data) {
        using var client = new SmtpClient($"smpt.{data.Domain}");
        var sender = new MailAddress($"{data.Username}@{data.Domain}", data.Username);
        var reciever = new MailAddress(data.Receiver ?? $"{data.Username}@{data.Domain}");

        using var message = new MailMessage(sender, reciever);
        message.Body = data.MailBody;
        message.Subject = data.Subject;
        message.BodyEncoding = Encoding.UTF8;
        message.SubjectEncoding = Encoding.UTF8;

        var result = new TaskCompletionSource<IActionResult>();
        client.SendCompleted += (o, args) => {
            if (args is { Cancelled: false, Error: null })
                result.SetResult(Ok());
            else result.SetResult(BadRequest(args.Error?.Message));
        };

        client.Credentials = new NetworkCredential(data.Username, data.Password);
        client.EnableSsl = true;
        await client.SendMailAsync(message);
        return await result.Task;
    }

    [HttpPost("list/{page}")]
    public async Task<ActionResult<MailContent[]>> GetMails([FromBody] Credentials credentials, [FromQuery] string folder, [FromRoute] int page) {
        using var client = new ImapClient($"imap.{credentials.Domain}", credentials.Username, credentials.Password);
        await client.SelectFolderAsync(folder);

        var messages = await client.ListMessagesByPageAsync(20, page, new PageSettingsAsync());
        var contents = new List<MailContent>();
        foreach (var message in messages.Items) {
            var content = new MailContent {
                Id = message.SequenceNumber,
                Sender = message.Sender,
                Subject = message.Subject,
                Time = message.Date,
                Read = message.IsRead
            };
            contents.Add(content);
        }

        return contents.ToArray();
    }

    [HttpPost("content/{id}")]
    public async Task<ActionResult<MailContent>> GetMail([FromBody] Credentials credentials, [FromRoute] int id) {
        using var client = new ImapClient($"imap.{credentials.Domain}", credentials.Username, credentials.Password);
        var message = await client.FetchMessageAsync(id);

        var content = new MailContent {
            Id = id,
            Sender = message.Sender,
            Subject = message.Subject.Replace("(Aspose.Email Evaluation)", ""),
            Time = message.Date,
            Read = true,
            Message = message.Body.Replace("EVALUATION ONLY. CREATED WITH ASPOSE.EMAIL FOR .NET. COPYRIGHT 2002-2022 ASPOSE PTY LTD. \r\n http://www.aspose.com/corporate/purchase/end-user-license-agreement.aspx: View EULA Online\r\n", ""),
            Attachments = message.Attachments.Select(a => a.Name).ToArray()
        };

        return content;
    }

    [HttpPost("folder")]
    public async Task<ActionResult<SingleResult<ImapFolderInfo[]>>> GetFolder([FromBody] Credentials credentials) {
        using var client = new ImapClient($"imap.{credentials.Domain}", credentials.Username, credentials.Password);
        var folders = await client.ListFoldersAsync();
        var results = new List<ImapFolderInfo>();

        foreach (var folder in folders) {
            results.Add(folder);
            if (folder.HasChildren) {
                var children = await client.ListFoldersAsync(folder.Name);
                results.AddRange(children);
            }
        }
        
        return new SingleResult<ImapFolderInfo[]> { Value = results.ToArray() };
    }

    [HttpPost("download/{id}/{attachment}")]
    public async Task<FileStreamResult> DownloadAttachment([FromBody] Credentials credentials, [FromRoute] int id, [FromRoute] string attachment) {
        using var client = new ImapClient($"imap.{credentials.Domain}", credentials.Username, credentials.Password);
        var data = await client.FetchAttachmentAsync(id, attachment);
        
        return new FileStreamResult(data.ContentStream, "application/octet-stream") {
            FileDownloadName = attachment
        };
    }

}