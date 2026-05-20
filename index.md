---
layout: default
title: About
permalink: /
---

<section class="hero">
  <p class="eyebrow">Software engineer</p>
  <h2>About</h2>
  <p>
    I'm Nihar Dwivedi, a software engineer focused on reliable systems,
    infrastructure, and product engineering. I like turning ambiguous problems
    into simple, durable software that can grow with the people who use it.
  </p>
  <p>
    My work has spanned site reliability, cloud infrastructure, operations,
    security, and full-stack development. I'm especially interested in
    distributed systems, developer platforms, and pragmatic engineering teams.
  </p>
  <p>
    Outside work, I follow software engineering writing, read science fiction,
    play guitar, and keep an eye out for the next interesting system to build.
  </p>
</section>

<section class="home-posts" aria-labelledby="top-blogs">
  <h2 id="top-blogs">Top 3 blogs</h2>
  <div class="posts compact-posts">
    {% for post in site.posts limit:3 %}
      <article class="post-card">
        <p class="post-date">{{ post.date | date: "%b %-d, %Y" }}</p>
        <h3><a href="{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></h3>
        <div class="entry">
          {{ post.excerpt | strip_html | truncatewords: 28 }}
        </div>
      </article>
    {% endfor %}
  </div>
</section>
