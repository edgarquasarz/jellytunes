Feature: Error Handling
  As a user
  I want to receive clear error messages when something goes wrong
  So that I understand what happened and can take action

  Background:
    Given the app is open on the login screen

  Scenario: Connection error is shown with an unreachable server
    When I enter the server URL "http://localhost:19999"
    And I enter the API key "some-key"
    And I click the connect button
    Then an error message should be visible
    And the connect button should still be enabled

  Scenario: Error message is visible after failed connection
    When I enter the server URL "http://localhost:19999"
    And I enter the API key "bad-key"
    And I click the connect button
    Then the error message element should exist

  Scenario: Connect button remains usable after an error
    When I enter the server URL "http://localhost:19999"
    And I enter the API key "bad-key"
    And I click the connect button
    And an error message should be visible
    Then I can re-enter credentials and try again
