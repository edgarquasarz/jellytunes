Feature: Library Search
  As an authenticated user
  I want to search my music library
  So that I can quickly find specific content

  Background:
    Given the user is authenticated and the library is loaded

  Scenario: Search input is visible in the library
    Then the search input should be visible

  Scenario: Searching shows matching results
    When I type "a" in the search input
    And I type "b" in the search input
    Then library items or an empty state should be shown

  Scenario: Empty search query shows no results message
    When I type "zzznomatchxxx" in the search input
    Then the library empty state should be visible

  Scenario: Clearing search restores the full list
    When I type "zzznomatchxxx" in the search input
    And I clear the search input
    Then library items should be visible
