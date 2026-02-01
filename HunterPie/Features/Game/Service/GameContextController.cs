using HunterPie.Core.Architecture.Events;
using HunterPie.Core.Client;
using HunterPie.Core.Domain.Process.Events;
using HunterPie.Core.Domain.Process.Service;
using HunterPie.Core.Game;
using HunterPie.Core.Observability.Logging;
using HunterPie.Core.Utils;
using HunterPie.Features.Scan.Service;
using HunterPie.Integrations.Services;
using HunterPie.ReactHunter.Nancy;
using System;
using System.Threading;
using System.Windows;
using System.Windows.Threading;

namespace HunterPie.Features.Game.Service;

internal class GameContextController(
    Dispatcher uiDispatcher,
    IProcessWatcherService processWatcherService,
    IGameContextService gameContextService,
    IBackupService backupService,
    IControllableScanService controllableScanService,
    DiscordPresenceFactory discordPresenceFactory,
    OverlayManager overlayManager,
    WidgetInitializers widgetInitializers) : IDisposable
{
    private readonly ILogger _logger = LoggerFactory.Create();

    private bool _isDisposed;
    private Core.Game.Context? _context;
    private readonly Dispatcher _uiDispatcher;
    private readonly IProcessWatcherService _processWatcherService;
    private readonly IGameContextService _gameContextService;
    private readonly IControllableScanService _controllableScanService;

    private CancellationTokenSource? _cancellationTokenSource;

    public GameContextController(
        Dispatcher uiDispatcher,
        IProcessWatcherService processWatcherService,
        IGameContextService gameContextService,
        IControllableScanService controllableScanService)
    {
        _uiDispatcher = uiDispatcher;
        _processWatcherService = processWatcherService;
        _gameContextService = gameContextService;
        _controllableScanService = controllableScanService;
    }

    public void Subscribe()
    {
        _processWatcherService.ProcessStart += OnProcessStart;
        _processWatcherService.ProcessExit += OnProcessExit;
    }

    private async void OnProcessStart(object? sender, ProcessEventArgs e)
    {
        _cancellationTokenSource = new CancellationTokenSource();
        _context = _gameContextService.Get(e.Game);

        _logger.Debug("Initialized game context");

        await _logger.CatchAndLogAsync(async () =>
        {
            _controllableScanService.Start(_cancellationTokenSource.Token);

            ReactHunter.Singletons.Context.HunterPieContext = _context;

            Console.WriteLine("Initialising nancy");
            NancyInitialiser.InitialiseNancy();
        });
    }

    private async void OnProcessExit(object? sender, EventArgs e)
    {
        if (_cancellationTokenSource is { })
            await _cancellationTokenSource.CancelAsync();

        _context?.Dispose();

        _context = null;

        _logger.Info("Process has closed");

        SmartEventsTracker.DisposeEvents();
        ContextInitializers.Dispose();

        if (ClientConfig.Config.Client.ShouldShutdownOnGameExit)
            _uiDispatcher.Invoke(Application.Current.Shutdown);
    }

    public void Dispose()
    {
        if (_isDisposed)
            return;

        _processWatcherService.ProcessStart += OnProcessStart;
        _processWatcherService.ProcessExit += OnProcessExit;
        _cancellationTokenSource?.Dispose();
        _isDisposed = true;
    }
}