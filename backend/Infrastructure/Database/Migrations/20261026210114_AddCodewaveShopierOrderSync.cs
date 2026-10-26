using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ktucec.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddCodewaveShopierOrderSync : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ConfirmationEmailSentAt",
                schema: "dbo",
                table: "CodewaveApplications",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PaidAmount",
                schema: "dbo",
                table: "CodewaveApplications",
                type: "decimal(10,2)",
                precision: 10,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PaidAt",
                schema: "dbo",
                table: "CodewaveApplications",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhoneKey",
                schema: "dbo",
                table: "CodewaveApplications",
                type: "nvarchar(16)",
                maxLength: 16,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "RefundedAt",
                schema: "dbo",
                table: "CodewaveApplications",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShopierOrderId",
                schema: "dbo",
                table: "CodewaveApplications",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CodewaveShopierOrders",
                schema: "dbo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderId = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    OrderCreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ProductId = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    ProductTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Total = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: true),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    BuyerFirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    BuyerLastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    BuyerEmail = table.Column<string>(type: "nvarchar(254)", maxLength: 254, nullable: true),
                    BuyerPhone = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                    CodewaveApplicationId = table.Column<int>(type: "int", nullable: true),
                    MatchMethod = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: true),
                    UnmatchedReason = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                    RefundedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CodewaveShopierOrders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CodewaveShopierOrders_CodewaveApplications_CodewaveApplicationId",
                        column: x => x.CodewaveApplicationId,
                        principalSchema: "dbo",
                        principalTable: "CodewaveApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CodewaveApplications_PhoneKey",
                schema: "dbo",
                table: "CodewaveApplications",
                column: "PhoneKey");

            migrationBuilder.CreateIndex(
                name: "IX_CodewaveShopierOrders_CodewaveApplicationId",
                schema: "dbo",
                table: "CodewaveShopierOrders",
                column: "CodewaveApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_CodewaveShopierOrders_OrderId",
                schema: "dbo",
                table: "CodewaveShopierOrders",
                column: "OrderId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CodewaveShopierOrders",
                schema: "dbo");

            migrationBuilder.DropIndex(
                name: "IX_CodewaveApplications_PhoneKey",
                schema: "dbo",
                table: "CodewaveApplications");

            migrationBuilder.DropColumn(
                name: "ConfirmationEmailSentAt",
                schema: "dbo",
                table: "CodewaveApplications");

            migrationBuilder.DropColumn(
                name: "PaidAmount",
                schema: "dbo",
                table: "CodewaveApplications");

            migrationBuilder.DropColumn(
                name: "PaidAt",
                schema: "dbo",
                table: "CodewaveApplications");

            migrationBuilder.DropColumn(
                name: "PhoneKey",
                schema: "dbo",
                table: "CodewaveApplications");

            migrationBuilder.DropColumn(
                name: "RefundedAt",
                schema: "dbo",
                table: "CodewaveApplications");

            migrationBuilder.DropColumn(
                name: "ShopierOrderId",
                schema: "dbo",
                table: "CodewaveApplications");
        }
    }
}
