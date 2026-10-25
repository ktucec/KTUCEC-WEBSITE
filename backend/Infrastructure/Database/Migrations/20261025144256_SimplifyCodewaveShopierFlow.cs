using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ktucec.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class SimplifyCodewaveShopierFlow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CodewaveApplications_OrderId",
                schema: "dbo",
                table: "CodewaveApplications");

            migrationBuilder.DropColumn(
                name: "RedeemedOrderId",
                schema: "dbo",
                table: "CodewaveStudentDiscounts");

            migrationBuilder.DropColumn(
                name: "ReservedOrderId",
                schema: "dbo",
                table: "CodewaveStudentDiscounts");

            migrationBuilder.DropColumn(
                name: "OrderId",
                schema: "dbo",
                table: "CodewaveApplications");

            migrationBuilder.DropColumn(
                name: "PaidAt",
                schema: "dbo",
                table: "CodewaveApplications");

            migrationBuilder.DropColumn(
                name: "PaymentId",
                schema: "dbo",
                table: "CodewaveApplications");

            migrationBuilder.RenameColumn(
                name: "ReservedUntil",
                schema: "dbo",
                table: "CodewaveStudentDiscounts",
                newName: "ShopierProductRequestedAt");

            migrationBuilder.RenameColumn(
                name: "RedeemedAt",
                schema: "dbo",
                table: "CodewaveStudentDiscounts",
                newName: "ShopierProductCreatedAt");

            migrationBuilder.AddColumn<string>(
                name: "ShopierProductCode",
                schema: "dbo",
                table: "CodewaveStudentDiscounts",
                type: "nvarchar(24)",
                maxLength: 24,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShopierProductId",
                schema: "dbo",
                table: "CodewaveStudentDiscounts",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShopierProductUrl",
                schema: "dbo",
                table: "CodewaveStudentDiscounts",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShopierProductUrl",
                schema: "dbo",
                table: "CodewaveApplications",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ShopierProductCode",
                schema: "dbo",
                table: "CodewaveStudentDiscounts");

            migrationBuilder.DropColumn(
                name: "ShopierProductId",
                schema: "dbo",
                table: "CodewaveStudentDiscounts");

            migrationBuilder.DropColumn(
                name: "ShopierProductUrl",
                schema: "dbo",
                table: "CodewaveStudentDiscounts");

            migrationBuilder.DropColumn(
                name: "ShopierProductUrl",
                schema: "dbo",
                table: "CodewaveApplications");

            migrationBuilder.RenameColumn(
                name: "ShopierProductRequestedAt",
                schema: "dbo",
                table: "CodewaveStudentDiscounts",
                newName: "ReservedUntil");

            migrationBuilder.RenameColumn(
                name: "ShopierProductCreatedAt",
                schema: "dbo",
                table: "CodewaveStudentDiscounts",
                newName: "RedeemedAt");

            migrationBuilder.AddColumn<string>(
                name: "RedeemedOrderId",
                schema: "dbo",
                table: "CodewaveStudentDiscounts",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReservedOrderId",
                schema: "dbo",
                table: "CodewaveStudentDiscounts",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OrderId",
                schema: "dbo",
                table: "CodewaveApplications",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "PaidAt",
                schema: "dbo",
                table: "CodewaveApplications",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentId",
                schema: "dbo",
                table: "CodewaveApplications",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CodewaveApplications_OrderId",
                schema: "dbo",
                table: "CodewaveApplications",
                column: "OrderId",
                unique: true);
        }
    }
}
