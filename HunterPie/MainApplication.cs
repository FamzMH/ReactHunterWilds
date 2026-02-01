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

internal class MainApplication : IDisposable
{
    private readonly ILogger _logger = LoggerFactory.Create();
    private readonly IAnalyticsService _analyticsService;
    private readonly IRemoteAccountConfigUseCase _remoteAccountConfigUseCase;
    private readonly IControllableWatcherService _controllableWatcherService;
    private readonly GameContextController _gameContextController;

    public MainApplication(
        IAnalyticsService analyticsService,
        IRemoteAccountConfigUseCase remoteAccountConfigUseCase,
        GameContextController gameContextController,
        IControllableWatcherService controllableWatcherService)
    {
        _analyticsService = analyticsService;
        _remoteAccountConfigUseCase = remoteAccountConfigUseCase;
        _gameContextController = gameContextController;
        _controllableWatcherService = controllableWatcherService;
    }

    public async Task<bool> Start()
    {
        _gameContextController.Subscribe();
        _controllableWatcherService.Start();

        return true;
    }

    public async Task SendUiException(Exception exception)
    {
        _logger.Error(exception.ToString());

        await _analyticsService.SendAsync(
            analyticsEvent: AnalyticsEvent.FromException(exception, isUiError: true)
        );
    }

    public async Task Restart()
    {
        await _remoteAccountConfigUseCase.Upload();

        string executablePath = typeof(MainApplication).Assembly.Location.Replace(".dll", ".exe");
        Process.Start(executablePath);
    }

    public void Dispose()
    {
        ConfigManager.SaveAll();
        AsyncHelper.RunSync(_remoteAccountConfigUseCase.Upload);
    }
}