jQuery(document).ready(function ($) {
  const $form = $("#mac-community-post-form");
  const $emailInput = $("#community_email");
  const $responseMsg = $("#form-response-message");

  // Hide message when user focuses on the input
  $emailInput.on("focus", function () {
    $responseMsg.text("").removeClass("success error");
  });

  $form.on("submit", function (e) {
    e.preventDefault();

    const $submitBtn = $form.find("#submit-community-post");
    const email = $emailInput.val();

    // Basic validation
    if (!email) {
      $responseMsg
        .text("Please provide your email to join the community.")
        .addClass("error")
        .removeClass("success");
      return;
    }

    // Email format validation
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailReg.test(email)) {
      $responseMsg
        .text("That doesn't look like a valid email. Please check and try again.")
        .addClass("error")
        .removeClass("success");
      return;
    }

    // Disable button and show loading state
    $submitBtn.prop("disabled", true).css("opacity", "0.5");
    $responseMsg.text("").removeClass("success error");

    $.ajax({
      url: macCommunityData.ajax_url,
      type: "POST",
      data: {
        action: "mac_create_community_post",
        nonce: macCommunityData.nonce,
        email: email,
      },
      success: function (response) {
        if (response.success) {
          $responseMsg
            .text(response.data.message)
            .addClass("success")
            .removeClass("error");
          $form[0].reset();
        } else {
          $responseMsg
            .text(response.data.message)
            .addClass("error")
            .removeClass("success");
        }
      },
      error: function () {
        $responseMsg
          .text("We couldn't connect to the community server. Please try again later.")
          .addClass("error")
          .removeClass("success");
      },
      complete: function () {
        $submitBtn.prop("disabled", false).css("opacity", "1");
      },
    });
  });
});
