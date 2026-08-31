using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ktucec.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddEventDetailFieldsAndGalleryImages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ApplicationUrl",
                table: "Events",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ParticipantCount",
                table: "Events",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "Events",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Summary",
                table: "Events",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "EventGalleryImage",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EventId = table.Column<int>(type: "int", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventGalleryImage", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EventGalleryImage_Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Events",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EventGalleryImage_EventId",
                table: "EventGalleryImage",
                column: "EventId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EventGalleryImage");

            migrationBuilder.DropColumn(
                name: "ApplicationUrl",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "ParticipantCount",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "Summary",
                table: "Events");
        }
    }
}
