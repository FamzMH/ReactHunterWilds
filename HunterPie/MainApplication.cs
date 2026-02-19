using HunterPie.Core.Analytics;
using HunterPie.Core.Client;
using HunterPie.Core.Domain.Process.Internal;
using HunterPie.Core.Observability.Logging;
using HunterPie.Core.Utils;
using HunterPie.Features.Account.UseCase;
using HunterPie.Features.Analytics.Entity;
using HunterPie.Features.Game.Service;
using System;
using System.Diagnostics;
using System.Threading.Tasks;

namespace HunterPie;

internal class MainApplication(
    IAnalyticsService analyticsService,
    IRemoteAccountConfigUseCase remoteAccountConfigUseCase,
    GameContextController gameContextController,
    IControllableWatcherService controllableWatcherService) : IDisposable
{
    private readonly ILogger _logger = LoggerFactory.Create();

    public async Task<bool> Start()
    {
        gameContextController.Subscribe();
        controllableWatcherService.Start();

        return true;
    }

    public async Task SendUiException(Exception exception)
    {
        _logger.Error(exception.ToString());

        await analyticsService.SendAsync(
            analyticsEvent: AnalyticsEvent.FromException(exception, isUiError: true)
        );
    }

    public async Task Restart()
    {
        await remoteAccountConfigUseCase.Upload();

        string executablePath = typeof(MainApplication).Assembly.Location.Replace(".dll", ".exe");
        Process.Start(executablePath);
    }

    public void Dispose()
    {
        ConfigManager.SaveAll();
        AsyncHelper.RunSync(remoteAccountConfigUseCase.Upload);
    }
}