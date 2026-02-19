using HunterPie.Core.Client.Localization;
using HunterPie.Core.Game;
using HunterPie.Core.Game.Entity;
using HunterPie.Core.Game.Entity.Enemy;
using HunterPie.Core.Game.Entity.Party;
using HunterPie.Core.Game.Entity.Player;
using HunterPie.Core.Game.Enums;
using HunterPie.DI;
using HunterPie.Features.Languages.Repository;
using HunterPie.Integrations.Datasources.MonsterHunterWilds.Entity.Enemy;
using HunterPie.Integrations.Datasources.MonsterHunterWilds.Entity.Player;
using HunterPie.Integrations.Datasources.MonsterHunterWorld.Entity.Player;
using HunterPie.ReactHunter.Singletons;
using HunterPie.UI.Architecture.Converters.Localizations;
using Nancy;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Windows.Navigation;

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

            // TODO: Can we use context.Game.TargetDetectionService.Target?
            IMonster? target = GetTarget(context);

            int timeLeft = 0;
            if (context.Game.Quest != null)
            {
                timeLeft = (int)context.Game.Quest.TimeLeft.TotalSeconds;
            }

            IReadOnlyCollection<IPartyMember> players = context.Game.Player.Party.Members;

            IReadOnlyCollection<IAbnormality> abnormalities = context.Game.Player.Abnormalities;

            IReadOnlyCollection<ISpecializedTool>? tools = GetTools(context);

            Dictionary<string, Dictionary<string, string>> localizations = GetTargetLocalizations(target, abnormalities, tools);

            var jsonSettings = new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver(),
                NullValueHandling = NullValueHandling.Include
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
                    players,
                    abnormalities,
                    tools,
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

    private static Dictionary<string, Dictionary<string, string>> GetTargetLocalizations(IMonster? target, IReadOnlyCollection<IAbnormality>? abnormalities,
        IReadOnlyCollection<ISpecializedTool>? tools) {
        var localizations = new Dictionary<string, Dictionary<string, string>>
        {
            { "target", new Dictionary<string, string>() },
            { "abnormalities", new Dictionary<string, string>() },
            { "tools", new Dictionary<string, string>() },
        };

        // Target
        if (target != null)
        {
            foreach (IMonsterPart part in target.Parts)
            {
                localizations["target"][part.Id.ToLower()] = LocalizationRepository.FindStringBy($"//Strings/Monsters/Shared/Part[@Id='{part.Id}']");
            }

            foreach (IMonsterAilment ailment in target.Ailments)
            {
                localizations["target"][ailment.Id.ToLower()] = LocalizationRepository.FindStringBy($"//Strings/Ailments/Rise/Ailment[@Id='{ailment.Id}']");
            }
        }

        // Abnormalities
        if (abnormalities != null)
        {
            foreach (IAbnormality abnormality in abnormalities)
            {
                localizations["abnormalities"][abnormality.Name.ToLower()] = LocalizationRepository.FindStringBy($"//Strings/Abnormalities/Abnormality[@Id='{abnormality.Name}']");
            }
        }

        // Tools
        if (tools != null)
        {
            foreach (ISpecializedTool tool in tools)
            {
                string? Id = ConvertToolTypeToId(tool.Id);
                if (Id != null)
                {
                    localizations["tools"][((int)tool.Id).ToString()] = LocalizationRepository.FindStringBy($"//Strings/SpecializedTools/Tool[@Id='{Id}']");
                }
            }
        }

        return localizations;
    }

    // Special handling needed since Rise doesn't have mantles
    private static IReadOnlyCollection<ISpecializedTool>? GetTools(IContext context)
    {
        return context.Game.Player switch
        {
            MHWPlayer player => player.Tools,

            MHWildsPlayer player => player.Tools,

            _ => null
        };
    }

    private static string? ConvertToolTypeToId(SpecializedToolType type)
    {
        string? localizationId = type switch
        {
            SpecializedToolType.None => null,
            SpecializedToolType.GhillieMantle => "GHILLIE_MANTLE",
            SpecializedToolType.TemporalMantle => "TEMPORAL_MANTLE",
            SpecializedToolType.HealthBooster => "HEALTH_BOOSTER",
            SpecializedToolType.RocksteadyMantle => "ROCKSTEADY_MANTLE",
            SpecializedToolType.ChallengerMantle => "CHALLENGER_MANTLE",
            SpecializedToolType.VitalityMantle => "VITALITY_MANTLE",
            SpecializedToolType.FireproofMantle => "FIREPROOF_MANTLE",
            SpecializedToolType.WaterproofMantle => "WATERPROOF_MANTLE",
            SpecializedToolType.IceproofMantle => "ICEPROOF_MANTLE",
            SpecializedToolType.ThunderproofMantle => "THUNDERPROOF_MANTLE",
            SpecializedToolType.DragonproofMantle => "DRAGONPROOF_MANTLE",
            SpecializedToolType.CleanserBooster => "CLEANSER_BOOSTER",
            SpecializedToolType.GliderMantle => "GLIDER_MANTLE",
            SpecializedToolType.EvasionMantle => "EVASION_MANTLE",
            SpecializedToolType.ImpactMantle => "IMPACT_MANTLE",
            SpecializedToolType.ApothecaryMantle => "APOTHECARY_MANTLE",
            SpecializedToolType.ImmunityMantle => "IMMUNITY_MANTLE",
            SpecializedToolType.AffinityBooster => "AFFINITY_BOOSTER",
            SpecializedToolType.BanditMantle => "BANDIT_MANTLE",
            SpecializedToolType.AssassinsHood => "ASSASSINS_HOOD",
            SpecializedToolType.MendingMantle => "MENDING_MANTLE",
            SpecializedToolType.CorruptedMantle => "CORRUPTED_MANTLE",
            _ => null
        };

        return localizationId;
    }

}
