import { BlogData } from './../models/blog-data';
import { CoreService } from './../services/core.service';
import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit {

  lstBlogItems: BlogData[] = [];
  showAddDialog = false;

  lstBlogRemoteItems: any[] = [];
  lstBlogRemotePlusItems: any[] = [];

  title: string = '';
  description: string = '';
  content: string = '';
  urlLink: string = '';

  cmItems: MenuItem[] = [];

  selectedBlogItem: BlogData = new BlogData();

  editing: boolean = false;

  constructor(private core: CoreService) { }

  ngOnInit(): void {
    let dataLocal = localStorage.getItem('localblog') != null ? localStorage.getItem('localblog') : '';
    if (dataLocal && dataLocal != '') {
      this.lstBlogItems = JSON.parse(dataLocal != null ? dataLocal : '');
    }
    this.getDataRemote();
    this.getDataRemotePlus();
  }

  getDataRemote() {
    const that = this;
    this.core.consumirWSGet('wsremote/external', null, function (resp: any) {
      if (resp != null) {
        //console.log(resp);
        for (const article of resp.articles) {
          const datatimePublished = article.publishedAt.split('T');
          article.publishedAt = datatimePublished[0] + ' ' + datatimePublished[1];
          that.lstBlogRemoteItems?.push(article);
        }
        //console.log(that.lstBlogRemoteItems);

      }
    })
  }
  getDataRemotePlus() {
    const that = this;
    this.core.consumirWSGet('wsremote/remotedata', null, function (resp: any) {
      if (resp != null) {
        //console.log('Remote data plus');
        console.log(resp);
        that.lstBlogRemotePlusItems=resp.articles;
        // for (const article of resp.articles) {
        //   //console.log(article);
          
        //   const datatimePublished = article.publishedAt.split('T');
        //   if(datatimePublished.length>=2){
        //     article.publishedAt = datatimePublished[0] + ' ' + datatimePublished[1];
        //   }
        //   that.lstBlogRemotePlusItems?.push(article);
        // }
        //console.log(that.lstBlogRemotePlusItems);

      }
    })
  }

  openRemoteLink(url: string) {
    //console.log('abre link: ' + url);
    //window.location.href = url;
    window.open(url, '_blank');
  }
  openDialog() {
    this.showAddDialog = true;
  }

  closeDialog() {
    this.showAddDialog = false;
    this.editing = false;
    this.title = '';
    this.description = '';
    this.content = '';
    this.urlLink = '';
  }

  openDialogToEdit(data: any) {
    //console.log(data);
    this.editing = true;
    this.title = data.title;
    this.description = data.description;
    this.content = data.content;
    this.urlLink = data.image;
    this.openDialog();
  }
  deleteItem(data: any) {
    const index = this.lstBlogItems.findIndex(x => x.title === data.title && x.content === data.content);
    this.lstBlogItems.splice(index, 1);
    localStorage.setItem('localblog', JSON.stringify(this.lstBlogItems));
  }


  addBlogItem() {
    if (this.editing) {
      const index = this.lstBlogItems.findIndex(x => x.title === this.title && x.content === this.content);
      this.lstBlogItems.splice(index, 1);
    }
    this.lstBlogItems.push({
      title: this.title,
      content: this.content,
      image: this.urlLink,
      description: this.description,
      publishedAt: this.timestampToString(new Date())?.toString()
    })

    localStorage.setItem('localblog', JSON.stringify(this.lstBlogItems));
    this.closeDialog();
  }

  timestampToString(date: Date) {
    // datePipeEn: DatePipe;
    const datePipeEn = new DatePipe('en-US');
    return datePipeEn.transform(date, 'dd/MM/yyyy HH:mm');
  }

}
