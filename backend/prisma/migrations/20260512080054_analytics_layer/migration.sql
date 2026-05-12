-- CreateTable: analytics_events (raw)
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT,
    "url" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "deviceType" TEXT,
    "os" TEXT,
    "browser" TEXT,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "ipHash" TEXT,
    "properties" JSONB,
    "leadId" TEXT,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "analytics_events_eventId_key" ON "analytics_events"("eventId");
CREATE INDEX "analytics_events_occurredAt_idx" ON "analytics_events"("occurredAt");
CREATE INDEX "analytics_events_sessionId_idx" ON "analytics_events"("sessionId");
CREATE INDEX "analytics_events_visitorId_idx" ON "analytics_events"("visitorId");
CREATE INDEX "analytics_events_type_occurredAt_idx" ON "analytics_events"("type", "occurredAt");
CREATE INDEX "analytics_events_path_occurredAt_idx" ON "analytics_events"("path", "occurredAt");
CREATE INDEX "analytics_events_leadId_idx" ON "analytics_events"("leadId");

-- CreateTable: analytics_sessions
CREATE TABLE "analytics_sessions" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "pageviews" INTEGER NOT NULL DEFAULT 0,
    "events" INTEGER NOT NULL DEFAULT 0,
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "bounced" BOOLEAN NOT NULL DEFAULT true,
    "entryPath" TEXT,
    "exitPath" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "referrer" TEXT,
    "country" TEXT,
    "deviceType" TEXT,
    "os" TEXT,
    "browser" TEXT,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "leadId" TEXT,

    CONSTRAINT "analytics_sessions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "analytics_sessions_startedAt_idx" ON "analytics_sessions"("startedAt");
CREATE INDEX "analytics_sessions_visitorId_idx" ON "analytics_sessions"("visitorId");
CREATE INDEX "analytics_sessions_leadId_idx" ON "analytics_sessions"("leadId");

-- CreateTable: analytics_daily_pageviews
CREATE TABLE "analytics_daily_pageviews" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "path" TEXT NOT NULL,
    "pageviews" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "avgDurationSeconds" INTEGER NOT NULL DEFAULT 0,
    "bounceRate" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "analytics_daily_pageviews_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "analytics_daily_pageviews_date_path_key" ON "analytics_daily_pageviews"("date", "path");
CREATE INDEX "analytics_daily_pageviews_date_idx" ON "analytics_daily_pageviews"("date");

-- CreateTable: analytics_daily_events
CREATE TABLE "analytics_daily_events" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT,
    "count" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "analytics_daily_events_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "analytics_daily_events_date_type_name_key" ON "analytics_daily_events"("date", "type", "name");
CREATE INDEX "analytics_daily_events_date_idx" ON "analytics_daily_events"("date");

-- CreateTable: analytics_daily_devices
CREATE TABLE "analytics_daily_devices" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "dimension" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sessions" INTEGER NOT NULL DEFAULT 0,
    "pageviews" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "analytics_daily_devices_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "analytics_daily_devices_date_dimension_value_key" ON "analytics_daily_devices"("date", "dimension", "value");
CREATE INDEX "analytics_daily_devices_date_dimension_idx" ON "analytics_daily_devices"("date", "dimension");

-- CreateTable: analytics_funnels
CREATE TABLE "analytics_funnels" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "name" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "visitors" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "analytics_funnels_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "analytics_funnels_date_name_step_key" ON "analytics_funnels"("date", "name", "step");
CREATE INDEX "analytics_funnels_date_name_idx" ON "analytics_funnels"("date", "name");

-- CreateTable: analytics_realtime
CREATE TABLE "analytics_realtime" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "country" TEXT,
    "deviceType" TEXT,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_realtime_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "analytics_realtime_visitorId_key" ON "analytics_realtime"("visitorId");
CREATE INDEX "analytics_realtime_lastSeenAt_idx" ON "analytics_realtime"("lastSeenAt");
