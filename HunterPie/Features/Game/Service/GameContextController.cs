using HunterPie.Core.Architecture.Events;
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

namespace HunterPie.Features.Game.Service;

internal class GameContextController(
    IProcessWatcherService processWatcherService,
    IGameContextService gameContextService,
    IControllableScanService controllableScanService) : IDisposable
{
    private readonly ILogger _logger = LoggerFactory.Create();

    private bool _isDisposed;
    private Context? _context;
    private readonly IProcessWatcherService _processWatcherService = processWatcherService;
    private readonly IGameContextService _gameContextService = gameContextService;
    private readonly IControllableScanService _controllableScanService = controllableScanService;

    private CancellationTokenSource? _cancellationTokenSource;

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

        Application.Current.Shutdown();
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