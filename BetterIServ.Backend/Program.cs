using PuppeteerSharp;

await new BrowserFetcher().DownloadAsync(BrowserFetcher.DefaultChromiumRevision);

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(options => {
    options.WithOrigins("http://localhost:8100");
    options.AllowCredentials();
    options.AllowAnyHeader();
    options.AllowAnyMethod();
});

app.UseAuthorization();

app.MapControllers();

app.Run();