namespace BetterIServ.Backend.Entities; 

public struct UnitsData {
    public IList<string> Notifications { get; set; }
    public IList<Substitution> Substitutions { get; set; }
}