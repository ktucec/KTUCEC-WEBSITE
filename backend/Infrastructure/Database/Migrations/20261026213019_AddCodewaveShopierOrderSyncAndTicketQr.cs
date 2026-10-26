using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ktucec.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddCodewaveShopierOrderSyncAndTicketQr : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TicketCode",
                schema: "dbo",
                table: "CodewaveApplications",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "TicketIssuedAt",
                schema: "dbo",
                table: "CodewaveApplications",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CodewaveTicketLookups",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Email = table.Column<string>(type: "nvarchar(254)", maxLength: 254, nullable: false),
                    OtpCodeHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    OtpCodeExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    OtpFailedAttempts = table.Column<int>(type: "int", nullable: false),
                    OtpLastSentAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    OtpSendWindowStartedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    OtpSendCount = table.Column<int>(type: "int", nullable: false),
                    LastRequestIp = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodewaveTicketLookups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CodewaveTicketScans",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CodewaveApplicationId = table.Column<int>(type: "int", nullable: false),
                    ScannedByUserId = table.Column<int>(type: "int", nullable: true),
                    ScannedByName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Result = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodewaveTicketScans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CodewaveTicketScans_CodewaveApplications_CodewaveApplicationId",
                        column: x => x.CodewaveApplicationId,
                        principalSchema: "dbo",
                        principalTable: "CodewaveApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CodewaveApplications_TicketCode",
                schema: "dbo",
                table: "CodewaveApplications",
                column: "TicketCode",
                unique: true,
                filter: "[TicketCode] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CodewaveTicketLookups_Email",
                schema: "dbo",
                table: "CodewaveTicketLookups",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CodewaveTicketScans_CodewaveApplicationId",
                schema: "dbo",
                table: "CodewaveTicketScans",
                column: "CodewaveApplicationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CodewaveTicketLookups",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "CodewaveTicketScans",
                schema: "dbo");

            migrationBuilder.DropIndex(
                name: "IX_CodewaveApplications_TicketCode",
                schema: "dbo",
                table: "CodewaveApplications");

            migrationBuilder.DropColumn(
                name: "TicketCode",
                schema: "dbo",
                table: "CodewaveApplications");

            migrationBuilder.DropColumn(
                name: "TicketIssuedAt",
                schema: "dbo",
                table: "CodewaveApplications");
        }
    }
}
