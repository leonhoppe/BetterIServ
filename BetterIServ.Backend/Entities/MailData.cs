namespace BetterIServ.Backend.Entities; 

public sealed class MailData : Credentials {

    public required string MailBody { get; set; }
    public required string Receiver { get; set; }
    public required string Subject { get; set; }
    
}