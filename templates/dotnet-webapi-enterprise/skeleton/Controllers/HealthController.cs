using Microsoft.AspNetCore.Mvc;

namespace Company.WebApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult GetHealth()
    {
        return Ok(new
        {
            Service = "${{ values.name }}",
            Status = "Healthy",
            Timestamp = DateTime.UtcNow
        });
    }
}
