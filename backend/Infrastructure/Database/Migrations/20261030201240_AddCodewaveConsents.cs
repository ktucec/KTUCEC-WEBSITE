using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ktucec.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddCodewaveConsents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ExplicitConsentAccepted",
                schema: "dbo",
                table: "CodewaveApplications",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "PrivacyNoticeAccepted",
                schema: "dbo",
                table: "CodewaveApplications",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExplicitConsentAccepted",
                schema: "dbo",
                table: "CodewaveApplications");

            migrationBuilder.DropColumn(
                name: "PrivacyNoticeAccepted",
                schema: "dbo",
                table: "CodewaveApplications");
        }
    }
}
