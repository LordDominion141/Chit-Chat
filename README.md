<!-- showscape:start template="turtle" v=1

{% heading title="Authentication" subtext="Everything you need to understand and integrate the authentication system." /%}

{% card title="How authentication works" icon="◈" %}
The authentication system uses secure HTTP-only cookies to maintain sessions between the client and server.
{% /card %}

{% columns count=3 %}
{% stat value="JWT" label="Authentication" /%}
{% stat value="24h" label="Session lifetime" /%}
{% stat value="HTTP" label="Transport" /%}
{% /columns %}

{% image url="https://share.google/G870pOSZVRrFukYpR" alt="Authentication flow" subtext="Figure 01 — Authentication request flow." /%}

{% card title="Request lifecycle" icon="↗" variant="purple" %}
Every authenticated request passes through the authentication middleware before reaching the protected route.
{% /card %}

showscape:end -->
