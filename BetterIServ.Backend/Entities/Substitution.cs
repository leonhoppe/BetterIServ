namespace BetterIServ.Backend.Entities; 

public struct Substitution {
    public string Class { get; set; }
    public int[] Times { get; set; }
    public string Type { get; set; }
    public string Representative { get; set; }
    public string Lesson { get; set; }
    public string Room { get; set; }
    public string Teacher { get; set; }
    public string Description { get; set; }
}
