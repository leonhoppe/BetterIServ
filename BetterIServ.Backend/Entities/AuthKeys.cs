namespace BetterIServ.Backend.Entities; 

public struct AuthKeys {
    public string Session { get; set; }
    public string Sat { get; set; }
    public string AuthSid { get; set; }
    public string SatId { get; set; }
    public string AuthSession { get; set; }

    public string ToCookieString() {
        return $"IServSession={Session}; IServSAT={Sat}; IServAuthSID={AuthSid}; IServSATId={SatId}; IServAuthSession={AuthSession}";
    }
}