# Audience analytics

The bio homepage uses [GoatCounter](https://www.goatcounter.com/), an open-source
analytics service with hosted and self-hosted options. GitHub Pages serves static
files; GoatCounter stores audience statistics and provides the shared count.

Dashboard: https://nihardwivedi.goatcounter.com/ (sign-in required).

## Connect a site

1. Create a GoatCounter site for `nihardwivedi.com` (or use your existing site).
2. Enable **Allow adding visitor counts on your website** in the site's settings.
   The rest of the dashboard can remain private.
3. Set `data-goatcounter-site` on `#view-counter` in `index.html` to your site URL,
   such as `https://your-account.goatcounter.com`.
4. Push to `master`; the existing GitHub Pages workflow publishes the update.

No API token, password, or other secret belongs in the repository or browser.
An empty site URL disables the integration and hides the counter.

## What is counted

The tracker records the homepage as `/`. Query strings and notebook tab changes
do not create separate page records. GoatCounter supplies visits, referrers,
countries, browser, and device information in its dashboard. Only the bio
homepage is instrumented; the Nix course is a separate site.

The footer displays **Homepage visits**, matching GoatCounter's default metric:
repeat loads of the same page within a session are deduplicated. It is not a count
of every refresh or a lifetime count of distinct people. Counts start when
tracking is activated and cannot recover past traffic. The `data-count-start` date
is September 17, 2026, when analytics was enabled for this site.

The public count endpoint can be cached for up to four hours. A blocked tracker
or disabled JavaScript can cause undercounting. If the count endpoint is disabled
or unavailable, the footer displays `Unavailable` instead of inventing a number.
Local previews do not send analytics events.

References: [visitor counter](https://www.goatcounter.com/help/visitor-counter),
[sessions and visitors](https://www.goatcounter.com/help/sessions).
