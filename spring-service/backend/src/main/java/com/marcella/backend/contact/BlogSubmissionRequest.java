package com.marcella.backend.contact;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BlogSubmissionRequest {
    private String name;
    private String email;
    private String title;
    private String content;
}
