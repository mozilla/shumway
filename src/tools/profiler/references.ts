
/// <reference path='../references.ts' />
/// <reference path='profile.ts' />
/// <reference path='timelineFrame.ts' />
/// <reference path='timelineBuffer.ts' />
/// <reference path='controller.ts' />
/// <reference path='mouseController.ts' />
/// <reference path='flameChartBase.ts' />
/// <reference path='flameChart.ts' />
/// <reference path='flameChartOverview.ts' />
/// <reference path='flameChartHeader.ts' />
/// <reference path='tracelogger/traceLogger.ts' />
/// <reference path='tracelogger/thread.ts' />

interface MouseWheelEvent extends MouseEvent {
  deltaX: number;
  deltaY: number;
  deltaZ: number;
}
