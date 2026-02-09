using HunterPie.Core.Client.Localization;
using HunterPie.Core.Game;
using HunterPie.Core.Game.Entity.Enemy;
using HunterPie.DI;
using HunterPie.Features.Languages.Repository;
using HunterPie.Integrations.Datasources.MonsterHunterWilds.Entity.Enemy;
using Nancy;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Linq;

namespace HunterPie.ReactHunter.Nancy;

public class MHWildsController : NancyModule
{

    private static ILocalizationRepository LocalizationRepository =>
    DependencyContainer.Get<ILocalizationRepository>();

    public MHWildsController()
    {

        Get("/", x => View["Web/index.html"]);

        Get("/get", x => {
            IContext context = Singletons.Context.HunterPieContext;

            IMonster target = GetTarget(context);
            Dictionary<string, string>? localizations = null;

            if (target != null)
            {
                localizations = GetLocalizations(target);
            }

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
                    target,
                    timeLeft,
                    localizations,
                }
            }, jsonSettings);
                

            return Response.AsJson(response);
        });
    }

    private static IMonster? GetTarget(IContext context)
    {
        IMonster? monster = null;

        try
        {
            monster = context.Game.Monsters.Where(monster => monster.Target == Core.Game.Enums.Target.Self).First();
        }
        catch (Exception)
        {

        }

        return monster;
    }

    private static Dictionary<string, string> GetLocalizations(IMonster target) {
        Dictionary<string, string> localizations = new();

        foreach (IMonsterPart part in target.Parts)
        {
            localizations[part.Id.ToLower()] = LocalizationRepository.FindStringBy($"//Strings/Monsters/Shared/Part[@Id='{part.Id}']");
        }

        foreach (IMonsterAilment ailment in target.Ailments)
        {
            localizations[ailment.Id.ToLower()] = LocalizationRepository.FindStringBy($"//Strings/Ailments/Rise/Ailment[@Id='{ailment.Id}']");
        }
        

        return localizations;
    }

}
