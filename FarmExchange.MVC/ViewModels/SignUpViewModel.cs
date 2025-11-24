using System.ComponentModel.DataAnnotations;
using FarmExchange.Models;

namespace FarmExchange.ViewModels
{
    public class SignUpViewModel
    {
        [Required]
        [StringLength(100)]
        [Display(Name = "Full Name")]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [Display(Name = "Email Address")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 6)]
        [DataType(DataType.Password)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [Compare("Password")]
        [DataType(DataType.Password)]
        [Display(Name = "Confirm Password")]
        public string ConfirmPassword { get; set; } = string.Empty;

        [Required]
        [Display(Name = "Account Type")]
        public UserType UserType { get; set; }

        [StringLength(255)]
        public string? Location { get; set; }

        [Phone]
        [Display(Name = "Phone Number")]
        public string? Phone { get; set; }
    }
}
