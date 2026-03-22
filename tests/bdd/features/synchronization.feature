Feature: Music Synchronization
  As a user
  I want to sync music to my device
  So that I can listen offline

  Background:
    Given the user is authenticated and the library is loaded

  Scenario: Add a folder as sync destination
    When I click the add folder button
    Then the add folder dialog should be triggered

  Scenario: Sync panel is shown when a destination is selected
    Given a saved destination is available in the sidebar
    When I click the destination in the sidebar
    Then the sync panel should be visible
    And the sync button should be visible

  Scenario: Sync button is disabled when no items are selected
    Given a saved destination is available in the sidebar
    When I click the destination in the sidebar
    Then the sync button should be disabled

  Scenario: Sync preview opens when items are selected and sync is clicked
    Given a saved destination is available in the sidebar
    And at least one library item is selected
    When I click the destination in the sidebar
    And I click the sync button
    Then the sync preview modal should be visible
    And the track count should be shown

  Scenario: MP3 toggle changes conversion mode
    Given a saved destination is available in the sidebar
    When I click the destination in the sidebar
    And I click the MP3 toggle
    Then the MP3 toggle should be on
