namespace BetterIServ.Backend.Entities; 

public struct DirectoryContent {
    public string Url { get; set; }
    public string Name { get; set; }
    public DateTime LastModified { get; set; }
    public string Type { get; set; }
    public long Size { get; set; }
}