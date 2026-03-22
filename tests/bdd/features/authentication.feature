Feature: Jellyfin Authentication
  As a JellyTunes user
  I want to connect to my Jellyfin server
  So that I can access my music library

  Background:
    Given the app is open on the login screen

  Scenario: Login form is shown with correct fields
    Then I should see the server URL input
    And I should see the API key input
    And I should see the connect button

  Scenario: Connect button is disabled when fields are empty
    When the URL field is empty
    And the API key field is empty
    Then the connect button should be disabled

  Scenario: Connection fails with unreachable server
    When I enter the server URL "http://localhost:19999"
    And I enter the API key "some-key"
    And I click the connect button
    Then an error message should be visible

  Scenario: User selector is shown when multiple users exist
    Given the app has reached the user selector screen
    Then I should see the user selector screen
    And at least one user option should be listed

  Scenario: Selecting a user loads the library
    Given the app has reached the user selector screen
    When I click the first user option
    Then the library content should be visible
