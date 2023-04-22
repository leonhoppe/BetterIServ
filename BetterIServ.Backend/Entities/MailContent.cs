using Aspose.Email;

namespace BetterIServ.Backend.Entities; 

public struct MailContent {
    public int Id { get; set; }
    public MailAddress Sender { get; set; }
    public string Subject { get; set; }
    public string Message { get; set; }
    public DateTime Time { get; set; }
    public bool Read { get; set; }
    public string[] Attachments { get; set; }
}