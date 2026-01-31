import { Injectable, Logger } from '@nestjs/common'

export interface AuditEvent {
  type: string
  ip: string
  wallet?: string
  endpoint: string
  metadata?: Record<string, any>
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger('AuditLog')

  log(event: AuditEvent) {
    this.logger.warn({
      timestamp: new Date().toISOString(),
      ...event,
    })
  }

  suspicious(event: AuditEvent) {
    this.logger.error({
      severity: 'HIGH',
      timestamp: new Date().toISOString(),
      ...event,
    })
  }
}
