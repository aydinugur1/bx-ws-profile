import {Component, OnInit} from '@angular/core';

import { DataService } from '../shared/services/data.service';

@Component({
  selector: 'learn',
  templateUrl: './learn.component.html',
  styleUrls: [ './learn.component.css' ]
})

export class LearnComponent implements OnInit {

  results: any[] =[];
  topics: any[] =[];

  discoverySpinner = false;

  constructor(
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.dataService.query(
  {filter:"enriched_text.categories:(score>0.8)",aggregation:"term(enriched_text.categories.label,count:99)",count:999}).then(data => {
    this.topics = data.aggregations[0].results
  })
  }

  queryData(requestString: string): void {
// check if request string is not empty
if(requestString !== "") {
  this.results = [];
  this.discoverySpinner = true;
  console.log(requestString);
  this.dataService.query(requestString).then(data => {
    console.log(data);
    data.results.forEach(result => {
      result.html = result.html.split('<body>')[1];
      result.html = result.html.split('</body>')[0];

      if(result.highlight.hasOwnProperty('html')) {
        result.highlight.html.forEach(highlight => {
          // fix split line-break marks
          highlight = highlight.split(/(?:<br\/>|<br)/g).join('<br/>');
          // mark highlight paragraphs in document
          let text = highlight.split('<em>').join('');
          text = text.split('</em>').join('');
          let textIndex = result.html.indexOf(text);
          if (textIndex > 0) {
            highlight.split('').join('');
            let html = result.html.slice(0, textIndex) + '<mark>' + highlight + '</mark>' + result.html.slice(textIndex + text.length);
            result.html = html;
          }
          // check highlight paragraphs in document
          let xss = new RegExp("<(?!br\/>|mark>|\/|p>|em>)");
          if (xss.test(result.html)) {
            console.warn(result.html);
          }
        })
      }
    });
    // show results in frontend
    this.discoverySpinner = false;
    this.results = data.results;
  });
}
}
}
