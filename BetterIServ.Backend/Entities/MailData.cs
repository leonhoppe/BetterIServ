namespace BetterIServ.Backend.Entities; 

public sealed class MailData : Credentials {

    public string? MailBody { get; set; }
    public string? Receiver { get; set; }
    public string? Subject { get; set; }
    
}