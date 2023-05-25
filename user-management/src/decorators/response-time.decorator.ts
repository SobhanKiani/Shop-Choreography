import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricType, Registry, Summary, collectDefaultMetrics } from 'prom-client';

import { url } from 'inspector';

@Injectable()
export class PrometheusInterceptor implements NestInterceptor {
    private readonly registry: Registry;
    private responstTimeSummary: Summary

    constructor() {
        this.registry = new Registry();
        this.responstTimeSummary = new Summary({
            name: "http_request_duration_ms",
            help: "http_request_duration_ms_help",
            registers: [this.registry]
        })
        this.registry.registerMetric(this.responstTimeSummary);
        collectDefaultMetrics({ register: this.registry, prefix: "user-management" });
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const timer = this.responstTimeSummary.startTimer()
        return next.handle().pipe(
            tap(async () => {
                timer();
            }),
        );
    }
}
