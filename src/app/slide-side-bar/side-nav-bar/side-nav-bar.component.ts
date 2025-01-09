import { NgClass, NgStyle } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-side-nav-bar',
  standalone: true,
  imports: [NgStyle, NgClass],
  templateUrl: './side-nav-bar.component.html',
  styleUrl: './side-nav-bar.component.scss'
})
export class SideNavBarComponent {
  @Input()slideOut = false;
  channels = ['Kanal1', 'Kekse essen']
  addedUsers = ['Plato', 'Friedrich Nietzsche', 'Carl Jung', 'Sigmund Freud']
  addedUserImg = ['00.Charaters.png', '01.Charaters.png', '02.Charaters.png', '03.Charaters.png']
  addedUserOnline = [true, false, false, true]
  onlineColor = '#92c73e';
  offlineColor = '#696969';

  addDirectMsg() { }

  addChannel() { }
}
