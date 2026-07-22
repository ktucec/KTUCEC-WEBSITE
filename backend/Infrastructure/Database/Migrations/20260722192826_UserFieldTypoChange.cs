using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ktucec.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class UserFieldTypoChange : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "LoginOtpCodeExpiresAt",
                table: "Users",
                newName: "OtpCodeExpiresAt");

            migrationBuilder.RenameColumn(
                name: "LoginOtpCode",
                table: "Users",
                newName: "OtpCode");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "OtpCodeExpiresAt",
                table: "Users",
                newName: "LoginOtpCodeExpiresAt");

            migrationBuilder.RenameColumn(
                name: "OtpCode",
                table: "Users",
                newName: "LoginOtpCode");
        }
    }
}
