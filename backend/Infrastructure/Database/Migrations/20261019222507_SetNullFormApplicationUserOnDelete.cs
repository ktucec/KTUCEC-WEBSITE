using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ktucec.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class SetNullFormApplicationUserOnDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FormApplications_Users_UserId",
                schema: "dbo",
                table: "FormApplications");

            migrationBuilder.AddForeignKey(
                name: "FK_FormApplications_Users_UserId",
                schema: "dbo",
                table: "FormApplications",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FormApplications_Users_UserId",
                schema: "dbo",
                table: "FormApplications");

            migrationBuilder.AddForeignKey(
                name: "FK_FormApplications_Users_UserId",
                schema: "dbo",
                table: "FormApplications",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
