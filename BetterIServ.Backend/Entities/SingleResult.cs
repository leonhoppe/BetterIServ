namespace BetterIServ.Backend.Entities; 

public struct SingleResult<TValue> {
    public TValue? Value { get; set; }
}