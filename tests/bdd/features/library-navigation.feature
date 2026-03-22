Feature: Library Navigation
  As an authenticated user
  I want to browse my music library
  So that I can find and select content to sync

  Background:
    Given the user is authenticated and the library is loaded

  Scenario: Artists tab is active by default
    Then the artists tab should be active
    And library items should be visible

  Scenario: Switch to albums tab
    When I click the albums tab
    Then the albums tab should be active
    And library items should be visible

  Scenario: Switch to playlists tab
    When I click the playlists tab
    Then the playlists tab should be active

  Scenario: Select an item with a checkbox
    Given a device is selected in the sidebar
    When I click the first library item
    Then the first library item should be selected

  Scenario: Filter items by selected state
    Given a device is selected in the sidebar
    And at least one library item is selected
    When I click the "Selected" sync filter
    Then only selected items should be visible
    When I click the "All" sync filter
    Then all items should be visible again
