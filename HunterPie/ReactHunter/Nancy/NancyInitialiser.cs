using Nancy.Hosting.Self;
using System;

namespace HunterPie.ReactHunter.Nancy;

internal static class NancyInitialiser
{

    private const string APIHost = "http://localhost:5151";

    internal static void InitialiseNancy()
    {
        HostConfiguration config = new HostConfiguration
        {
            RewriteLocalhost = true
        };

        var host = new NancyHost(config, new Uri(APIHost));
        host.Start();
        
        Console.WriteLine("React Hunter Wilds ready at: " + APIHost);
    }
}
