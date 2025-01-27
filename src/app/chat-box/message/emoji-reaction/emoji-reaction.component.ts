import { Component, Input, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { ClickOutsideDirective } from '../../click-outside.directive';
import { CommonModule } from '@angular/common';
import { Message } from '../../../interfaces/message.interface';
import { UserService } from '../../../services/user.service';
import { MessageService } from '../../../services/message.service';
import { EmojiService } from '../../../services/emoji.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-emoji-reaction',
  standalone: true,
  imports: [MatIconModule,
    PickerComponent,
    ClickOutsideDirective,
    CommonModule,
  ],
  templateUrl: './emoji-reaction.component.html',
  styleUrl: './emoji-reaction.component.scss'
})
export class EmojiReactionComponent {


  emojiPickerOn: boolean = false;
  userService = inject(UserService);
  messageService = inject(MessageService);
  emojiService = inject(EmojiService);
  @Input() message!: Message;
  @Input() chatType: 'private' | 'channel' | 'thread' | 'new' = 'new'
  @Input() loggedUser: string = '';
  private emojiSubscription!: Subscription;



  ngOnInit(): void {
    this.emojiSubscription = this.emojiService.emojiSelected$.subscribe(({ event, destination }) => {
      if (destination === 'reaction') {
        this.addEmoji(event);
      }
    });
  }


  ngOnDestroy(): void {
    if (this.emojiSubscription) {
      this.emojiSubscription.unsubscribe();
    }
  }

  getUserName(userId: string): string | null {
    const user = this.userService.users.find(
      (user) => user.id === userId
    );

    if (user) {
      if (userId === this.userService.loggedUserId) {
        return `${user.name} (Du)`;

      }
      return user.name;
    }
    return null;
  }


  addEmoji(event: any): void {
    const emoji = event.emoji.native;
    if (this.emojiService.reactionMessage) {
      const existingReaction = this.emojiService.reactionMessage.reactions.find(
        (reaction: { emoji: string; users: string[] }) => reaction.emoji === emoji
      );

      if (existingReaction && !this.alreadyReacted(emoji)) {

        if (!existingReaction.users.includes(this.loggedUser)) {
          existingReaction.users.push(this.loggedUser);
        }
      } else if (!this.alreadyReacted(emoji)) {

        this.emojiService.reactionMessage.reactions.push({
          emoji: emoji,
          users: [this.loggedUser],
        });
      }
      this.pushToRecentEmojis(emoji);
      this.messageService.updateMessage(this.emojiService.reactionMessage);
      console.log(this.emojiService.reactionMessage);
      this.emojiService.closeEmojiPicker();
    }
  }


  pushToRecentEmojis(emoji: string): void {
    if (this.emojiService.reactionMessage?.recentEmojis) {
      if (this.emojiService.reactionMessage.recentEmojis.includes(emoji)) {
        return;
      } else {
        this.emojiService.reactionMessage.recentEmojis.push(emoji);
      }
      if (this.emojiService.reactionMessage.recentEmojis.length > 2) {
        this.emojiService.reactionMessage.recentEmojis.shift();
      }
    }
  }


  addExistingEmoji(existingEmoji: string, message: Message): void {
    this.emojiService.reactionMessage = message;
    if (this.emojiService.reactionMessage?.reactions) {
      const existingReaction = this.emojiService.reactionMessage.reactions.find(
        (reaction: { emoji: string; users: string[] }) => reaction.emoji === existingEmoji
      );

      if (existingReaction && !this.alreadyReacted(existingEmoji)) {
        existingReaction.users.push(this.loggedUser);
      } else if (this.alreadyReacted(existingEmoji)) {
        this.removeEmoji(existingEmoji);
      }

      this.messageService.updateMessage(this.emojiService.reactionMessage);
    }
  }



  removeEmoji(emoji: string): void {
    if (this.emojiService.reactionMessage?.reactions) {
      const reactionIndex = this.emojiService.reactionMessage.reactions.findIndex(
        (reaction: { emoji: string; users: string[] }) => reaction.emoji === emoji
      );

      if (reactionIndex !== -1) {
        const reaction = this.emojiService.reactionMessage.reactions[reactionIndex];

        reaction.users = reaction.users.filter((user: string) => user !== this.loggedUser);

        if (reaction.users.length === 0) {
          this.emojiService.reactionMessage.reactions.splice(reactionIndex, 1);
        }
      }
    }
  }

  alreadyReacted(reactedEmoji: string): boolean {
    if (!this.emojiService.reactionMessage?.reactions) {
      return false;
    }
    return this.emojiService.reactionMessage.reactions.some(
      (reaction: { emoji: string; users: string[] }) =>
        reaction.users.includes(this.loggedUser) && reaction.emoji === reactedEmoji
    );
  }




}