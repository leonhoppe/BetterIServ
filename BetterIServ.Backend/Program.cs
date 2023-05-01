using PuppeteerSharp;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddCors(options => {
    options.AddPolicy("BetterIserv", policy => {
        policy.WithOrigins("http://localhost", "http://localhost:8100")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) {
    await new BrowserFetcher().DownloadAsync(BrowserFetcher.DefaultChromiumRevision);
    
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("BetterIserv");

app.UseAuthorization();

app.MapControllers();

app.Run();