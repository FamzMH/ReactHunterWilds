using HunterPie.Core.Game;
using HunterPie.Core.Game.Entity.Enemy;
using Nancy;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Linq;

namespace HunterPie.ReactHunter.Nancy;

public class MHWController : NancyModule
{

    public MHWController()
    {


        Get("/", x => View["Web/index.html"]);

        Get("/get", x => {
            IContext context = Singletons.Context.HunterPieContext;

            IReadOnlyCollection<IMonster> monsters = context.Game.Monsters;

            int timeLeft = 0;
            if (context.Game.Quest != null)
            {
                timeLeft = (int)context.Game.Quest.TimeLeft.TotalSeconds;
            }
            
            var jsonSettings = new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            };

            string response = JsonConvert.SerializeObject(new
            {
                isSuccess = true,
                date = DateTime.Now.ToString(),
                data = new
                {
                    monsters,
                    timeLeft,
                }
            }, jsonSettings);
                

            return Response.AsJson(response);
        });
    }

}
