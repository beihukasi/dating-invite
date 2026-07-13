-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "girl_name" TEXT NOT NULL,
    "dashboard_token" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Date" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invite_id" TEXT NOT NULL,
    "date_label" TEXT NOT NULL,
    "date_value" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Date_invite_id_fkey" FOREIGN KEY ("invite_id") REFERENCES "Invite" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invite_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "note" TEXT,
    "created_by" TEXT NOT NULL DEFAULT 'host',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Location_invite_id_fkey" FOREIGN KEY ("invite_id") REFERENCES "Invite" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Response" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invite_id" TEXT NOT NULL,
    "selected_date_id" TEXT NOT NULL,
    "selected_location_id" TEXT,
    "location_name" TEXT,
    "location_note" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Response_invite_id_fkey" FOREIGN KEY ("invite_id") REFERENCES "Invite" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Response_selected_date_id_fkey" FOREIGN KEY ("selected_date_id") REFERENCES "Date" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Response_selected_location_id_fkey" FOREIGN KEY ("selected_location_id") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Invite_dashboard_token_key" ON "Invite"("dashboard_token");
