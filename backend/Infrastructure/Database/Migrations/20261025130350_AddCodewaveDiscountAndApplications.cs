using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ktucec.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddCodewaveDiscountAndApplications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CodewaveStudentDiscounts",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Email = table.Column<string>(type: "nvarchar(254)", maxLength: 254, nullable: false),
                    StudentNumber = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false),
                    OtpCodeHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    OtpCodeExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    OtpFailedAttempts = table.Column<int>(type: "int", nullable: false),
                    OtpLastSentAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    OtpSendWindowStartedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    OtpSendCount = table.Column<int>(type: "int", nullable: false),
                    IsVerified = table.Column<bool>(type: "bit", nullable: false),
                    VerifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DiscountCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ReservedOrderId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                    ReservedUntil = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RedeemedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RedeemedOrderId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                    LastRequestIp = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodewaveStudentDiscounts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CodewaveApplications",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(254)", maxLength: 254, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    City = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    AttendeeType = table.Column<int>(type: "int", nullable: false),
                    Language = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    ListPrice = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    DiscountAmount = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    TotalPrice = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    CodewaveStudentDiscountId = table.Column<int>(type: "int", nullable: true),
                    DiscountCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    PaymentId = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    PaidAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodewaveApplications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CodewaveApplications_CodewaveStudentDiscounts_CodewaveStudentDiscountId",
                        column: x => x.CodewaveStudentDiscountId,
                        principalSchema: "dbo",
                        principalTable: "CodewaveStudentDiscounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CodewaveApplications_CodewaveStudentDiscountId",
                schema: "dbo",
                table: "CodewaveApplications",
                column: "CodewaveStudentDiscountId");

            migrationBuilder.CreateIndex(
                name: "IX_CodewaveApplications_Email",
                schema: "dbo",
                table: "CodewaveApplications",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_CodewaveApplications_OrderId",
                schema: "dbo",
                table: "CodewaveApplications",
                column: "OrderId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CodewaveApplications_Status",
                schema: "dbo",
                table: "CodewaveApplications",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_CodewaveStudentDiscounts_DiscountCode",
                schema: "dbo",
                table: "CodewaveStudentDiscounts",
                column: "DiscountCode",
                unique: true,
                filter: "[DiscountCode] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CodewaveStudentDiscounts_Email",
                schema: "dbo",
                table: "CodewaveStudentDiscounts",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CodewaveApplications",
                schema: "dbo");

            migrationBuilder.DropTable(
                name: "CodewaveStudentDiscounts",
                schema: "dbo");
        }
    }
}
