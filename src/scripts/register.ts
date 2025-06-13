interface RegisterResponse {
  requiresEmailConfirmation?: boolean;
  error?: string;
}

const handleRegistration = async (email: string, password: string, confirmPassword: string): Promise<void> => {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, confirmPassword }),
    });

    const data = (await response.json()) as RegisterResponse;

    if (!response.ok) {
      throw new Error(data.error || "Wystąpił błąd podczas rejestracji");
    }

    // Handle successful registration
    if (data.requiresEmailConfirmation) {
      // Show message about email confirmation
      window.alert(
        "Rejestracja zakończona sukcesem! Sprawdź swoją skrzynkę pocztową i potwierdź adres email, aby aktywować konto."
      );
      // Redirect to login page with email confirmation info
      window.location.href = "/auth/login?confirmation=true";
    } else {
      // Redirect to login page after successful registration
      window.location.href = "/auth/login?registered=true";
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Wystąpił błąd podczas rejestracji";
    window.alert(errorMessage);
  }
};

const initializeRegistrationForm = (): void => {
  const registerForm = document.querySelector("form");

  if (!registerForm) {
    return;
  }

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailInput = document.querySelector("#email") as HTMLInputElement;
    const passwordInput = document.querySelector("#password") as HTMLInputElement;
    const confirmPasswordInput = document.querySelector("#confirmPassword") as HTMLInputElement;

    if (!emailInput || !passwordInput || !confirmPasswordInput) {
      return;
    }

    const email = emailInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    await handleRegistration(email, password, confirmPassword);
  });
};

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initializeRegistrationForm);
